/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-dados-acesso", []) 

.controller("administrativo-dados-acessoCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$filter,$timeout,
                                                      /*$campos,*/$webapi,$apis){ 
    
    // Exibição
    $scope.itens_pagina = [10, 20, 50, 100]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Filtros
    $scope.filiais = [];
    $scope.adquirentes = [];
    $scope.dadosAcesso = [];
    $scope.adquirentescadastro = [];                                             
    $scope.statusSenha = [{status : true, nome : 'Válida'},
                          {status : false, nome : 'Inválida'}];
    
    $scope.filtro = {filial : null, adquirente : null, status : null,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyDadosPos = 1; // posição da div que vai receber o loading progress
    // Cadastro
    $scope.cadastro = {adquirente : null, login : '', estabelecimento : '', senha : ''};                                     // Alteração
    $scope.alterando = true;                                             
    $scope.alteracao = {id : 0, login : '', estabelecimento : '', senha : ''};                                             
    // flag
    $scope.exibePrimeiraLinha = false; 
    $scope.exibeTela = false;                                             
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    //var permissaoRemocao = false;
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_dadosAcessoInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Dados de Acesso';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.status = null;
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                    $scope.adquirentes = [];
                    $scope.bandeiras = [];
                }
            }
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            //permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            if($scope.usuariologado.grupoempresa) buscaFiliais();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Carrega filiais
        //if($scope.usuariologado.grupoempresa) buscaFiliais();
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar dados de acesso
      */
    $scope.usuarioPodeCadastrarDadosAcesso = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.filial !== null && permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar info de dados de acesso
      */
    $scope.usuarioPodeAlterarDadosAcesso = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.filial !== null && permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir dados de acesso
      * /
    $scope.usuarioPodeExcluirDadosAcesso = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.filial !== null && permissaoRemocao;
    } */                                             
                                                 
    
    
                                                 
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){

        $scope.filtro.adquirente = $scope.filtro.status = null; 

        if($scope.filiais.length > 0 && $scope.filtro.filial !== $scope.filiais[0]){
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false);
            buscaAdquirentesCadastro();
        }
        // Refaz a busca
        buscaDadosDeAcesso();
    }
    
    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(){
        
       $scope.showProgress(divPortletBodyFiltrosPos);    
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros = [{id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo}];
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                $scope.filtro.filial = $scope.filiais.length > 0 ? $scope.filiais[0] : null;
                // Busca adquirentes
                $scope.filtro.adquirente = null;
                buscaDadosDeAcesso();
                buscaAdquirentes(true);
                buscaAdquirentesCadastro();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        $scope.filtro.adquirente = null;
        buscaDadosDeAcesso();
        buscaAdquirentes(true);
    };
    
                                                                                         
    // ADQUIRENTES 
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressEstaAberto){
     
       if($scope.filtro.filial === null){
           $scope.filtro.adquirente = null;
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos);    
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.filtro.filial !== null) filtros = {id: 300,
                                                    //id: $campos.pos.operadora.empresa + $campos.cliente.empresa.nu_cnpj - 100, 
                                                    valor: $scope.filtro.filial.nu_cnpj};
       
       $webapi.get($apis.getUrl($apis.pos.operadora, 
                                [$scope.token, 0, /*$campos.pos.operadora.nmOperadora*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                $scope.filtro.adquirente = null;
                // Busca bandeiras
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(idBandeira, progressEstaAberto){
        // ...
    };
                                                 
    
    /**
      * Carrega adquirentes cadastro
      */
    var buscaAdquirentesCadastro = function(){
        $webapi.get($apis.getUrl($apis.pos.adquirente, 
                                 [$scope.token, 0, /*$campos.pos.adquirente.descricao*/ 102, 0],
                                 {id: /*$campos.pos.adquirente.status*/ 103, valor: 1})) // somente as adquirentes com status = 1
            .then(function(dados){           
                // Obtém os dados
                $scope.adquirentescadastro = dados.Registros;
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes de cadastro (' + failData.status + ')', true, 'danger', true);
              });    
    };
                                                 
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaDadosDeAcesso();
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
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
        $scope.paginaInformada = $scope.filtro.pagina; 
    };
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaDadosAcesso();
    }; 
                                                 
                                                 
                                                 
    // BUSCA DOS DADOS DE ACESSO                                            
    /**
      * Avalia os filtros
      */
    $scope.buscaDadosAcesso = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           return;
       }
        // Nova busca
        buscaDadosDeAcesso();
    };                                             
    /**
      * Retorna os filtros para ser usado junto a url para requisição via webapi
      */
    var obtemFiltroDeBusca = function(){
       var filtros = [];
       // Filial
       var filtroFilial = {id: /*$campos.pos.loginoperadora.cnpj*/ 105, 
                           valor: $scope.filtro.filial.nu_cnpj};
       filtros.push(filtroFilial);  
        
       // Adquirente
       if($scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: /*$campos.pos.loginoperadora.idOperadora*/ 106, 
                                   valor: $scope.filtro.adquirente.id};
           filtros.push(filtroAdquirente);
       } 
        
       // Bandeira
       if($scope.filtro.status !== null){
           var filtroStatus = {id: /*$campos.pos.loginoperadora.status*/ 104, 
                               valor: $scope.filtro.status.status};
           filtros.push(filtroStatus);
       }
       
       // Retorna    
       return filtros;
    };  
                                                                                        
                                                 
                                                 
    /**
      * Efetiva a busca
      */
    var buscaDadosDeAcesso = function(progressoemexecucao){
        
        if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           if(progressoemexecucao){
                $scope.hideProgress(divPortletBodyFiltrosPos);     
                $scope.hideProgress(divPortletBodyDadosPos);        
           }
           return;
        }
        
        if(!progressoemexecucao){
           $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
           $scope.showProgress(divPortletBodyDadosPos);
        }
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       $webapi.get($apis.getUrl($apis.pos.loginoperadora, 
                                [$scope.token, 3, 
                                 /*$campos.pos.loginoperadora.idGrupo*/ 107, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                // Obtém os dados
                $scope.dadosAcesso = dados.Registros;

                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.dadosAcesso.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyDadosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório sintético (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyDadosPos);
              });       
    };
                                                 
        
                                                 
    /**
      * Exibe a linha para criar um novo cadastro
      */
    $scope.novoDadoDeAcesso = function(){
        // Reseta os valores
        $scope.cadastro.adquirente = null; 
        $scope.cadastro.login = ''; 
        $scope.cadastro.estabelecimento = '';
        $scope.cadastro.senha = '';
        // Exibe a linha
        $scope.exibePrimeiraLinha = true;        
    };
    /**
      * Esconde a linha para criar um novo cadastro ou alterar
      */                                             
    $scope.cancelar = function(){
        $scope.exibePrimeiraLinha = false;    
    };
    var validaDadoAcesso = function(old){
       if($scope.cadastro.adquirente === null){
           $scope.showModalAlerta('Selecione uma adquirente!');
           return false;
       }
       if($scope.cadastro.login.trim().length < 3){
           $scope.showModalAlerta('Preencha um login com no mínimo 3 caracteres!');
           return false;
       }
       if($scope.cadastro.senha.trim().length < 3){
           $scope.showModalAlerta('Preencha uma senha com no mínimo 3 caracteres!');
           return false;
       }
       if(typeof old === 'undefined' || old.operadora.desOperadora.toUpperCase() !== d.operadora.desOperadora.toUpperCase()){ 
           if($filter('filter')($scope.dadosAcesso, function(d){return d.operadora.desOperadora.toUpperCase() === $scope.cadastro.adquirente.descricao.toUpperCase();}).length > 0){
               $scope.showModalAlerta("Já consta um registro para a adquirente '" + $scope.cadastro.adquirente.descricao + "'!");
               return false;
           }
       }
       return true;
    };
    /**
      * Salva os dados de acesso
      */                                              
    $scope.salvarDadosAcesso = function(){
       if(!validaDadoAcesso()) return;    
       // Cadastra
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyDadosPos);
       var jsonDadoAcesso = {
           login : $scope.cadastro.login,
           senha : $scope.cadastro.senha,
           cnpj : $scope.filtro.filial.nu_cnpj,
           idGrupo : $scope.usuariologado.grupoempresa.id_grupo,
           estabelecimento : $scope.cadastro.estabelecimento ? $scope.cadastro.estabelecimento : null, 
           operadora : { nmOperadora : $scope.cadastro.adquirente.nome/*descricao*/ }
       };
       /*console.log(jsonDadoAcesso);
       $scope.exibePrimeiraLinha = false;
       $scope.hideProgress(divPortletBodyFiltrosPos);
       $scope.hideProgress(divPortletBodyDadosPos);*/
        
       $webapi.post($apis.getUrl($apis.pos.loginoperadora, undefined,
                                 {id : 'token', valor : $scope.token}), jsonDadoAcesso) 
            .then(function(dados){           
                $scope.showAlert('Cadastrado com sucesso!', true, 'success', true);
                // Esconde a linha
                $scope.exibePrimeiraLinha = false;
                // Relista
                buscaDadosDeAcesso(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao realizar o cadastro (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyDadosPos);
              });   
                    
    };
    /**
      * Altera o dado de acesso
      */
    $scope.editarDadosAcesso = function(dadoacesso){
         // Reseta os valores
        $scope.alteracao.id = dadoacesso.id;
        $scope.alteracao.login = dadoacesso.login; 
        $scope.alteracao.estabelecimento = dadoacesso.estabelecimento && dadoacesso.estabelecimento !== null ? dadoacesso.estabelecimento : '';
        $scope.alteracao.senha = dadoacesso.senha;
        // Exibe na linha
        $scope.alterando = true;       
    };
    /**
      * Cancela a alteração
      */
    $scope.cancelaAlteracao = function(){
        $scope.alteracao.id = 0; 
        $scope.alterando = false; 
    };
    /**
      * Cancela a alteração
      */                                             
    $scope.alteraDadosAcesso = function(old){
       if(typeof old === 'undefined') return; 
       // Verifica se houve alteração
       /*if(old.login === $scope.alteracao.login &&
          old.senha === $scope.alteracao.senha &&
          (old.estabelecimento === null && !$scope.alteracao.estabelecimento || 
           old.estabelecimento === $scope.alteracao.estabelecimento)){
            $scope.cancelaAlteracao();
            return;
       }*/
        // PERMITE ENVIAR PARA O SERVIDOR SEM ALTERAR NADA => PODE SER UTILIZADO PARA ARMAZENAR NO LOGEXECUTION
        
       if($scope.alteracao.login.trim().length < 3){
           $scope.showModalAlerta('Preencha um login com no mínimo 3 caracteres!');
           return false;
       }
       if($scope.alteracao.senha.trim().length < 3){
           $scope.showModalAlerta('Preencha uma senha com no mínimo 3 caracteres!');
           return false;
       }
       // Altera
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyDadosPos);
       var jsonDadoAcesso = {
           id : $scope.alteracao.id,
           login : $scope.alteracao.login,
           senha : $scope.alteracao.senha,
           estabelecimento : $scope.alteracao.estabelecimento ? $scope.alteracao.estabelecimento : null
       };
       //console.log(jsonDadoAcesso);
       $webapi.update($apis.getUrl($apis.pos.loginoperadora, undefined,
                                   {id : 'token', valor : $scope.token}), jsonDadoAcesso) 
            .then(function(dados){           
                $scope.showAlert('Alterado com sucesso!', true, 'success', true);
                // Esconde a linha
                $scope.cancelaAlteracao();
                // Relista
                buscaDadosDeAcesso(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao atualizar os dados (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyDadosPos);
              }); 
    };
    
}]);