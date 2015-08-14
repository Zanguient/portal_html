/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("conta", []) 

.controller("contaCtrl", ['$scope',
                          '$state',
                          '$webapi',
                          '$apis', 
                          /*'$campos',*/
                          '$filter',
                          function($scope,$state,$webapi,$apis,/*$campos,*/$filter){  
    
    $scope.tab = 2;
    
    $scope.usuario = undefined;
    var divPortletBodyContaPos = 0;
    // Alteração
    $scope.newpessoa = { nm_pessoa : '', dt_nascimento: '', 
				         nu_ramal: '', nu_telefone: ''};
    $scope.newconta = { ds_email : '', ds_login : '' };                          
    // flags
    $scope.exibeTela = false;                          
    $scope.editandoDadosPessoais = false;                          
    $scope.editandoDadosConta = false; 
    var dataValida = false;
    var loginValido = false;
    var emailValido = false;                           
                              
    
    // Inicialização do controller
    $scope.contaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Minha Conta';                          
        $scope.pagina.subtitulo = '';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Obtém os dados do usuário logado
            buscaUsuarioLogado();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Obtém os dados do usuário logado
        //buscaUsuarioLogado();
    } 
    
    //TAB
    /**
      * Retorna true se a tab informada corresponde a tab em exibição
      */
    $scope.tabIs = function (tab){
        return $scope.tab === tab;
    }
    /**
      * Altera a tab em exibição
      */
    $scope.setTab = function (tab){
        if (tab >= 1 && tab <= 4) $scope.tab = tab;        
    }
    
    
    // USUÁRIO
    /**
      * Busca Usuário
      */
    var buscaUsuarioLogado = function(progressoEmExibicao){
        if(!progressoEmExibicao) $scope.showProgress(divPortletBodyContaPos);
        $webapi.get($apis.getUrl($apis.administracao.webpagesusers, [$scope.token, 3])) 
            .then(function(dados){
                $scope.usuario = dados.Registros[0];
                // Esconde o progress
                $scope.hideProgress(divPortletBodyContaPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao requisitar dados do usuário (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyContaPos);
              });     
    }
    
    
    
    // EDIÇÕES
    /**
      * Faz o update
      */
    var atualizaUsuarioLogado = function(json, funcaoSucesso){
        //console.log(json);
        $scope.showProgress(divPortletBodyContaPos);
        $webapi.update($apis.getUrl($apis.administracao.webpagesusers, undefined, 
                                    {id: 'token', valor: $scope.token}), json)
        .then(function(dados){
                 // Remove da visão os edits
                 if(typeof funcaoSucesso === 'function') funcaoSucesso();
                 // Exibe o sucesso
                 $scope.showAlert('Dados pessoais alterados com sucesso!', true, 'success', true);     
                 // Obtém os dados atualizados
                 if(json.webpagesusers.fl_ativo) buscaUsuarioLogado(true);
                 else $scope.voltarTelaLogin();
              },function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao alterar os dados pessoais do usuário (' + failData.status + ')', true, 'danger', true);
                 progressoCadastro(false);
                 $scope.hideProgress(divPortletBodyContaPos);
              });        
    }
    
    // DADOS PESSOAIS
    
    $scope.dataValida = function(){
        return dataValida || $scope.newpessoa.dt_nascimento === '';    
    };
    $scope.validaData = function(){
        if($scope.newpessoa.dt_nascimento){
            if($scope.newpessoa.dt_nascimento.length < 10) dataValida = false;
            else{
                var parts = $scope.newpessoa.dt_nascimento.split("/");
                var data = new Date(parts[2], parts[1] - 1, parts[0]);
                // Verifica se a data é válida
                dataValida = parts[0] == data.getDate() && (parts[1] - 1) == data.getMonth() && parts[2] == data.getFullYear();
            }
        }else dataValida = false;
    };
    var nomeValido = function(){
        return $scope.newpessoa.nm_pessoa.length > 0;    
    };                          
    var telefoneValido = function(){
        return $scope.newpessoa.nu_telefone === $scope.usuario.pessoa.nu_telefone || 
               $scope.newpessoa.nu_telefone === '' || 
               ($scope.newpessoa.nu_telefone && $scope.newpessoa.nu_telefone.length >= 12);    
    };
    var ramalValido = function(){
        return $scope.newpessoa.nu_ramal === $scope.usuario.pessoa.nu_ramal || 
               $scope.newpessoa.nu_ramal === '' || 
               ($scope.newpessoa.nu_ramal && $scope.newpessoa.nu_ramal.length >= 2);    
    };                          
    
    /**
      * Exibe os inputs
      */
    $scope.editaInformacoesPessoais = function(){
        $scope.newpessoa.dt_nascimento = $scope.getDataString($scope.usuario.pessoa.dt_nascimento);
        $scope.newpessoa.nm_pessoa = $scope.usuario.pessoa.nm_pessoa;
        $scope.newpessoa.nu_telefone = $scope.usuario.pessoa.nu_telefone;
        $scope.newpessoa.nu_ramal = $scope.usuario.pessoa.nu_ramal;
        dataValida = true;
        // Exibe os inputs
        $scope.editandoDadosPessoais = true;                                
    }
    /**
      * Remove da visão os inputs, sem alterar nada
      */
    $scope.cancelaEdicaoDadosPessoais = function(){
        $scope.editandoDadosPessoais = false;      
    }
    /**
      * Avalia se houveram mudanças
      */
    $scope.alteraInformacoesPessoais = function(){
        // Houve alterações?
        if($scope.newpessoa.dt_nascimento === $scope.getDataString($scope.usuario.pessoa.dt_nascimento) &&
           $scope.newpessoa.nm_pessoa === $scope.usuario.pessoa.nm_pessoa &&
           $scope.newpessoa.nu_telefone === $scope.usuario.pessoa.nu_telefone &&
           $scope.newpessoa.nu_ramal === $scope.usuario.pessoa.nu_ramal){
            // Não houve alterações!
            $scope.cancelaEdicaoDadosPessoais();
            return;
        }     
        var nome = nomeValido();
        var data_nasc = $scope.dataValida();
        var telefone = telefoneValido();
        var ramal = ramalValido();
        if(nome && data_nasc && telefone && ramal){
            // Cria o JSON
            var jsonPessoa = {};
            if($scope.usuario.pessoa.nm_pessoa !== $scope.newpessoa.nm_pessoa)
                jsonPessoa.nm_pessoa = $scope.newpessoa.nm_pessoa;
            if($scope.getDataString($scope.usuario.pessoa.dt_nascimento) !== $scope.newpessoa.dt_nascimento){
                //var dt = $scope.newpessoa.dt_nascimento.split('/');
                jsonPessoa.dt_nascimento = $scope.getDataFromString($scope.newpessoa.dt_nascimento);//$filter('date')(new Date(dt[2], dt[1] - 1, dt[0], 1, 0, 0, 0), "yyyy-MM-dd HH:mm:ss");
            }
            if($scope.usuario.pessoa.nu_telefone !== $scope.newpessoa.nu_telefone)
                jsonPessoa.nu_telefone = $scope.newpessoa.nu_telefone;    
            if($scope.usuario.pessoa.nu_ramal !== $scope.newpessoa.nu_ramal)
                jsonPessoa.nu_ramal = $scope.newpessoa.nu_ramal;
            
            // Json do usuário
            var jsonUsuario = {id_users : $scope.usuario.webpagesusers.id_users, 
                               fl_ativo : $scope.usuario.webpagesusers.fl_ativo};
            
            
            var json = { pessoa : jsonPessoa,
                         webpagesusers : jsonUsuario };
            
            // Atualiza
            atualizaUsuarioLogado(json, $scope.cancelaEdicaoDadosPessoais);
        }else{
            if(!nome) $scope.showModalAlerta('Nome é obrigatório!');
            else if(!data_nasc) $scope.showModalAlerta('Insira uma data de nascimento válida!');
            else if(!telefone) $scope.showModalAlerta('Telefone deve conter no mínimo 10 dígitos!');
            else if(!ramal) $scope.showModalAlerta('Ramal deve conter no mínimo 2 dígitos!');
            else $scope.showModalAlerta('Por favor, revise as informações');
        }
    }
    
    
    // CONTA
    
    //Valida e-mail
    $scope.validaEmail = function(){
        if($scope.newconta.ds_email){
            if($scope.usuario.webpagesusers.ds_email !== null && 
               $scope.usuario.webpagesusers.ds_email.toLowerCase() === $scope.newconta.ds_email.toLowerCase()){ 
                // Não alterou o e-mail
                $('#labelEmailEmUso').hide();
                emailValido = true;
                $('#icon-email').hide(); // sem exibir o ícone
                return;
            }
            $scope.validandoEmail = true;
            $webapi.get($apis.getUrl($apis.administracao.webpagesusers, [$scope.token, 0], 
                                     {id:/*$campos.administracao.webpagesusers.ds_email*/ 102, 
                                      valor:$scope.newconta.ds_email.toLowerCase()}))
            // Verifica se a requisição foi respondida com sucesso
                .then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelEmailEmUso').show();
                                emailValido = false;
                                $('#icon-email').show();
                            }else{
                                $('#labelEmailEmUso').hide();
                                emailValido = true;
                                $('#icon-email').show();
                            }
                            $scope.validandoEmail = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR E-MAIL");
                            $scope.validandoEmail = false;
                        });
        }else emailValido = false;  
        
    };
    //Valida login
    $scope.validaLogin = function(){
        if($scope.newconta.ds_login){
            if($scope.usuario.webpagesusers !== null && 
               $scope.usuario.webpagesusers.ds_login === $scope.newconta.ds_login){ 
                // Não alterou o login
                $('#labelLoginEmUso').hide();
                loginValido = true;
                $('#icon-login').hide(); // sem exibir o ícone
                return;
            }
            $scope.validandoLogin = true;
            $webapi.get($apis.getUrl($apis.administracao.webpagesusers, [$scope.token, 0], 
                                     {id:/*$campos.administracao.webpagesusers.ds_login*/ 101, 
                                      valor:$scope.newconta.ds_login}))
            // Verifica se a requisição foi respondida com sucesso
                .then(function(dados){
                            console.log(dados[0]);
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelLoginEmUso').show();
                                loginValido = false;
                                $('#icon-login').show();
                            }else{
                                $('#labelLoginEmUso').hide();
                                loginValido = true;
                                $('#icon-login').show();
                            }
                            $scope.validandoLogin = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR LOGIN");
                            $scope.validandoLogin = false;
                        });
        }else loginValido = false;  
    };
    
    $scope.loginValido = function(){
        return loginValido && $scope.newconta.ds_login && 
            $scope.newconta.ds_login.length >= 3 && $scope.newconta.ds_login.length <= 20;    
    }
    $scope.emailValido = function(){
        return emailValido;    
    }
                              
    /**
      * Exibe os inputs
      */
    $scope.editaInformacoesConta = function(){
        $scope.newconta.ds_email = $scope.usuario.webpagesusers.ds_email;
        $scope.newconta.ds_login = $scope.usuario.webpagesusers.ds_login;
        loginValido = emailValido = true;
        // Exibe os inputs
        $scope.editandoDadosConta = true;                                
    }
    /**
      * Remove da visão os inputs, sem alterar nada
      */
    $scope.cancelaEdicaoDadosConta = function(){
        $scope.editandoDadosConta = false;      
    }
    /**
      * Solicita confirmação para desativar a conta
      */
    $scope.desativarConta = function(){
        var json = { webpagesusers: { id_users : $scope.usuario.webpagesusers.id_users, 
                                      fl_ativo : false
                                    }
                   };
        var textoConfirmacao = 'Tem certeza que deseja desativar a conta? Se confirmado, sua conta ficará inutilizada até ser reativada por um administrador';
        if(!$scope.usuario.webpagesusers.fl_ativo){ 
            // Vai ativar, em vez de ativar.... (na verdade, isso não deve ser possível, visto que o usuário inativo não consegue acessar a própria conta)
            json.webpagesusers.fl_ativo = true;
            textoConfirmacao = 'Tem certeza que deseja ativar a conta?';
        }
        // Exibe um modal de confirmação
        $scope.showModalConfirmacao('Confirmação', textoConfirmacao, atualizaUsuarioLogado, json, 'Sim', 'Não');
    }
    

     /**
      * Avalia se houveram mudanças
      */
    $scope.alteraInformacoesConta = function(){
        
        // Não faz nada se tiver validando campos
        if($scope.validandoEmail || $scope.validandoLogin) return;
        
        // Houve alterações?
        if($scope.newconta.ds_email && 
           $scope.newconta.ds_email.toLowerCase() === $scope.usuario.webpagesusers.ds_email.toLowerCase() &&
           $scope.newconta.ds_login === $scope.usuario.webpagesusers.ds_login){
            // Não houve alterações!
            $scope.cancelaEdicaoDadosConta();
            return;
        }     
        var login = $scope.loginValido();
        var email = $scope.emailValido();
        if(login && email){
            // Json do usuário
            var jsonUsuario = {id_users : $scope.usuario.webpagesusers.id_users, 
                               fl_ativo : $scope.usuario.webpagesusers.fl_ativo };
            if($scope.newconta.ds_email.toLowerCase() !== $scope.usuario.webpagesusers.ds_email.toLowerCase())
                jsonUsuario.ds_email = $scope.newconta.ds_email.toLowerCase(); 
            if($scope.newconta.ds_login !== $scope.usuario.webpagesusers.ds_login)
                jsonUsuario.ds_login = $scope.newconta.ds_login;
            
            var json = { webpagesusers : jsonUsuario };
            
            // Atualiza
            atualizaUsuarioLogado(json, $scope.cancelaEdicaoDadosConta);
        }else{
            if(!login) $scope.showModalAlerta('Informe um login válido!');
            else if(!email) $scope.showModalAlerta('Insira um endereço de e-mail válido!');
        }
    }
    
}]);