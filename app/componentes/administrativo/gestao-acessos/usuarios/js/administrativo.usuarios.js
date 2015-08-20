/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-usuarios", []) 

.controller("administrativo-usuariosCtrl", ['$scope',
                                            '$state',
                                            '$filter',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            function($scope,$state,$filter,/*$campos,*/$webapi,$apis){ 
   
    var divPortletBodyUsuarioPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.usuarios = [];
    $scope.camposBusca = [
                          {
                            id: /*$campos.administracao.webpagesusers.ds_email*/ 102,
                            ativo: true,  
                            nome: "E-mail"
                          },{
                            id: /*$campos.administracao.webpagesusers.ds_login*/ 101,
                            ativo: true,
                            nome: "Login"
                          },{
                              id: 301,
                            //id: $campos.administracao.webpagesusers.grupo_empresa + ($campos.cliente.grupoempresa.ds_nome - 100), 
                            ativo : !$scope.usuariologado.grupoempresa, // é desativado quando o $scope.usuariologado.grupoempresa !== undefined
                            nome: "Empresa"
                          },{
                              id: 404,
                            //id: $campos.administracao.webpagesusers.empresa + (/*$campos.cliente.empresa.ds_fantasia*/ 104 - 100), 
                            ativo: true,
                            nome: "Filial"
                          },
                         ];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.busca = ''; // model do input de busca                                            
    $scope.usuario = {busca:'', campo_busca : $scope.camposBusca[1], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: /*$campos.administracao.webpagesusers.ds_email*/ 102, order : 0}};
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
    // flags
    $scope.exibeTela = false;                                            
                                                
    // Inicialização do controller
    $scope.administrativoUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Usuários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){
            if($scope.exibeTela){
                // Modifica a visibilidade do campo de busca para o grupo empresa
                $scope.camposBusca[2].ativo = !$scope.usuariologado.grupoempresa;   
                // Refaz a busca
                $scope.buscaUsuarios();
            }
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length > 0;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length > 0;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'REMOÇÃO' }).length > 0;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca Usuários
            $scope.buscaUsuarios();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca Usuários
        //$scope.buscaUsuarios();
    };
                                                
                                                
    // PERMISSÕES                                           
    /**
      * Retorna true se o usuário pode cadastrar usuários
      */
    $scope.usuarioPodeCadastrarUsuarios = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar info de usuários
      */
    $scope.usuarioPodeAlterarUsuarios = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir usuários
      */
    $scope.usuarioPodeExcluirUsuarios = function(){
        return permissaoRemocao;
    } 
    /**
      * Retorna true se o usuário pode ativar/desativar usuários
      */
    $scope.usuarioPodeDesativarUsuarios = function(){
        return permissaoRemocao; // pode ter uma permissão exclusiva (funcionalidade)
    };                                            
                                                
                                            
    // ORDENAÇÃO
    /**
      * Modifica a ordenação
      */
    var ordena = function(posCampo){
        if(posCampo >= 0 && posCampo < $scope.camposBusca.length){
            if($scope.usuario.campo_ordenacao.id !== $scope.camposBusca[posCampo].id){ 
                $scope.usuario.campo_ordenacao.id = $scope.camposBusca[posCampo].id;
                $scope.usuario.campo_ordenacao.order = 0; // começa descendente                                 
            }else
                // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
                $scope.usuario.campo_ordenacao.order = $scope.usuario.campo_ordenacao.order === 0 ? 1 : 0;                                
            $scope.buscaUsuarios(); 
        }
    };
    /**
      * Ordena por e-mail. 
      * Se já estava ordenando por e-mail, inverte a forma de ordenação
      */
    $scope.ordenaPorEmail = function(){
        ordena(0);
    };
    /**
      * Ordena por login. 
      * Se já estava ordenando por login, inverte a forma de ordenação
      */
    $scope.ordenaPorLogin = function(){
        ordena(1);
    };
    /**
      * Ordena por grupo empresa. 
      * Se já estava ordenando por grupo empresa, inverte a forma de ordenação
      */
    $scope.ordenaPorGrupoEmpresa = function(){
        ordena(2);
    }; 
    /**
      * Ordena por empresa. 
      * Se já estava ordenando por empresa, inverte a forma de ordenação
      */
    $scope.ordenaPorEmpresa = function(){
        ordena(3);
    };                                         
    /**
      * Retorna true se a ordenação está sendo feito por e-mail de forma crescente
      */
    $scope.estaOrdenadoCrescentePorEmail = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.usuario.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por e-mail de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorEmail = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.usuario.campo_ordenacao.order === 1;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por login de forma crescente
      */
    $scope.estaOrdenadoCrescentePorLogin = function(){
        return $scope.usuario.campo_ordenacao.id == $scope.camposBusca[1].id && 
               $scope.usuario.campo_ordenacao.order == 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por login de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorLogin = function(){
        return $scope.usuario.campo_ordenacao.id == $scope.camposBusca[1].id && 
               $scope.usuario.campo_ordenacao.order == 1;    
    }; 
    /**
      * Retorna true se a ordenação está sendo feito por grupo empresa de forma crescente
      */
    $scope.estaOrdenadoCrescentePorGrupoEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[2].id && 
               $scope.usuario.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por grupo empresa de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorGrupoEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[2].id && 
               $scope.usuario.campo_ordenacao.order === 1;    
    }; 
    /**
      * Retorna true se a ordenação está sendo feito por empresa de forma crescente
      */
    $scope.estaOrdenadoCrescentePorEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[3].id && 
               $scope.usuario.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por empresa de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[3].id && 
               $scope.usuario.campo_ordenacao.order === 1;    
    };                                          
                                            
                                            
                                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.usuario.total_paginas){ 
           $scope.usuario.pagina = pagina;
           $scope.buscaUsuarios(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.usuario.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.usuario.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.usuario.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.usuarios.length > 0) $scope.buscaUsuarios();   
    };
     
    // BUSCA
    $scope.resetaBusca = function(){
        $scope.busca = '';
        $scope.filtraUsuarios();
    };
    $scope.filtraUsuarios = function(){
        $scope.usuario.busca = $scope.busca;
        $scope.buscaUsuarios();
    };
    $scope.buscaUsuarios = function(){
       //$scope.showAlert('Obtendo usuários'); // exibe o alert
       $scope.showProgress(divPortletBodyUsuarioPos);    
        
       var filtros = undefined;
       
       // Verifica se tem algum valor para ser filtrado    
       if($scope.usuario.busca.length > 0) filtros = {id: $scope.usuario.campo_busca.id, valor: $scope.usuario.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){
            var filtroGrupoEmpresa = {id: /*$campos.administracao.webpagesusers.id_grupo*/ 103, valor: $scope.usuariologado.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = filtroGrupoEmpresa;
       }
        
       $scope.obtendoUsuarios = true;
       $webapi.get($apis.getUrl($apis.administracao.webpagesusers, 
                                [$scope.token, 2, $scope.usuario.campo_ordenacao.id, 
                                 $scope.usuario.campo_ordenacao.order, 
                                 $scope.usuario.itens_pagina, $scope.usuario.pagina],
                                filtros)) 
            .then(function(dados){
                $scope.usuarios = dados.Registros;
                $scope.usuario.total_registros = dados.TotalDeRegistros;
                $scope.usuario.total_paginas = Math.ceil($scope.usuario.total_registros / $scope.usuario.itens_pagina);
                if($scope.usuarios.length === 0) $scope.usuario.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.usuario.pagina - 1)*$scope.usuario.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.usuario.itens_pagina;
                    if(registroFinal > $scope.usuario.total_registros) registroFinal = $scope.usuario.total_registros;
                    $scope.usuario.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                $scope.obtendoUsuarios = false;
                //$scope.hideAlert(); // fecha o alert
                $scope.hideProgress(divPortletBodyUsuarioPos);
                // Verifica se a página atual é maior que o total de páginas
                if($scope.usuario.pagina > $scope.usuario.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
              },
              function(failData){
                 //console.log("FALHA AO OBTER USUARIOS: " + failData.status);
                 $scope.obtendoUsuarios = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao requisitar usuários (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyUsuarioPos);
              }); 
    };
                                                
                                                
                                                
    // AÇÕES
    /**
      * Solicita confirmação para desativar o usuário
      */                                           
    $scope.desativar = function(usuario){
        var json = { webpagesusers: { id_users : usuario.webpagesusers.id_users, 
                                      fl_ativo : false
                                    }
                   };
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja desativar ' + usuario.webpagesusers.ds_login + ' ?',
                                     ativaUsuario, json, 'Sim', 'Não');    
    };
    /**
      * Solicita confirmação para ativar o usuário
      */
    $scope.ativar = function(usuario){
        var json = { webpagesusers: { id_users : usuario.webpagesusers.id_users, 
                                      fl_ativo : true
                                    }
                   };
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja ativar ' + usuario.webpagesusers.ds_login + ' ?',
                                     ativaUsuario, json, 'Sim', 'Não');
    };
    /**
      * Efetiva a ativação/desativação do usuário
      */
    var ativaUsuario = function(json){
         $scope.showProgress(divPortletBodyUsuarioPos);
         // Atualiza
         $webapi.update($apis.getUrl($apis.administracao.webpagesusers, undefined,
                                  {id: 'token', valor: $scope.token}), json)
                .then(function(dados){
                     // Exibe a mensagem de sucesso
                    $scope.showAlert('Status ativo do usuário alterado com sucesso!', true, 'success', true);
                    // Hide progress
                    $scope.hideProgress(divPortletBodyUsuarioPos);
                    // Refaz a busca
                    $scope.buscaUsuarios();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', 
                                                                true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao alterar o status ativo do usuário (' + 
                                           failData.status + ')', true, 'danger', true);
                     // Hide progress
                     $scope.hideProgress(divPortletBodyUsuarioPos);
                  });    
    };                                            
    /**
      * Redefinir senha
      */                                            
    var resetaSenhaDoUsuario = function(id_users){
        //console.log("RESETANDO A SENHA DO USUARIO " + usuario.webpagesusers.ds_email + "(" + usuario.webpagesusers.id_users + ")"); 
        //$scope.showAlert('Redefinindo senha do usuário'); // exibe o alert
        $scope.showProgress(divPortletBodyUsuarioPos);
        
        // json reseta senha
        var jsonResetSenha = {userId: id_users, novaSenha: ''};
        
        $webapi.update($apis.getUrl($apis.administracao.webpagesmembership, undefined,
                       {id: 'token', valor: $scope.token}), jsonResetSenha)
            .then(function(dados){
                    $scope.showAlert('Senha redefinida com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyUsuarioPos);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao redefinir a senha do usuário (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress(divPortletBodyUsuarioPos);
                  }); 
    };
    /**
      * Solicitação confirmação para resetar a senha
      */
    $scope.resetarSenhaDoUsuario = function(usuario){
        $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja resetar a senha de ' + usuario.webpagesusers.ds_email,
                         resetaSenhaDoUsuario, usuario.webpagesusers.id_users,
                         'Sim', 'Não');
    };
    /**
      * Editar usuario => Abre tela de cadastro, enviando como parâmetro o objeto usuario
      */
    $scope.editarUsuario = function(usuario){
        $scope.goAdministrativoUsuariosCadastro({usuario:usuario});
    }; 
    /**
      * Excluir usuario
      */                                            
    var exluirUsuario = function(id_users){
        // Deleta
        //$scope.showAlert('Deletando usuário'); // exibe o alert
        $scope.showProgress(divPortletBodyUsuarioPos);
        $webapi.delete($apis.getUrl($apis.administracao.webpagesusers, undefined,
                       [{id: 'token', valor: $scope.token},{id: 'id_users', valor: id_users}]))
            .then(function(dados){
                    $scope.showAlert('Usuário excluído com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyUsuarioPos);
                    // atualiza tela de usuários
                    $scope.buscaUsuarios();
                  },function(failData){
                     //console.log("FALHA AO DELETAR USUARIO: " + failData.status);
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 500) $scope.showModalAlerta('Não é possível excluir o usuário. O que pode ser feito é a desativação do mesmo');
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir o usuário (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyUsuarioPos);
                  }); 
    };
    /**
      * Solicitação confirmação para excluir o usuário
      */                                                                              
    $scope.exluirUsuario = function(usuario){
        // Envia post para deletar
        $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja excluir ' + usuario.webpagesusers.ds_email,
                         exluirUsuario, usuario.webpagesusers.id_users,
                         'Sim', 'Não');
    };                                               

}])