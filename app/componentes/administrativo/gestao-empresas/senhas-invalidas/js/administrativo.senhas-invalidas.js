/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-senhas-invalidas", []) 

.controller("administrativo-senhas-invalidasCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$filter,$timeout,
                                                      /*$campos,*/$webapi,$apis){ 
    
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200]; 
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
    var divPortletBodyDadosPos = 0; // posição da div que vai receber o loading progress
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
    $scope.administrativo_senhasInvalidasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Senhas inválidas';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Refaz a busca
            if($scope.exibeTela) $scope.buscaSenhasInvalidas();
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length > 0;   
            //permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados de acesso com senha inválida
            $scope.buscaSenhasInvalidas();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Carrega dados de acesso com senha inválida
        //$scope.buscaSenhasInvalidas();
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode alterar info de dados de acesso
      */
    $scope.usuarioPodeAlterarDadosAcesso = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir dados de acesso
      * /
    $scope.usuarioPodeExcluirDadosAcesso = function(){
        return permissaoRemocao;
    } */                                             
                                                 

    
                                                 
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           $scope.buscaSenhasInvalidas();
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
        if($scope.dadosAcesso.length > 0) $scope.buscaSenhasInvalidas();
    }; 
                                                 
                                                 
                                                 
    // BUSCA DOS DADOS DE ACESSO COM SENHAS INVÁLIDAS                                        
                                           
    /**
      * Retorna os filtros para ser usado junto a url para requisição via webapi
      */
    var obtemFiltroDeBusca = function(){
        if($scope.usuariologado.grupoempresa) return {id: /*$campos.pos.loginoperadora.idGrupo*/ 107, 
                                        valor: $scope.usuariologado.grupoempresa.id_grupo};
       
        return undefined;
    };  
                                                                                        
                                                 
                                                 
    /**
      * Busca as senhas inválidas
      */
    $scope.buscaSenhasInvalidas = function(progressoemexecucao){
        
        if(!progressoemexecucao)  
           $scope.showProgress(divPortletBodyDadosPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       $webapi.get($apis.getUrl($apis.pos.loginoperadora, 
                                [$scope.token, 4, 
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
                $scope.hideProgress(divPortletBodyDadosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório sintético (' + failData.status + ')', true, 'danger', true);
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
       if(old.login === $scope.alteracao.login &&
          old.senha === $scope.alteracao.senha &&
          (old.estabelecimento === null && !$scope.alteracao.estabelecimento || 
           old.estabelecimento === $scope.alteracao.estabelecimento)){
            $scope.cancelaAlteracao();
            return;
       }
        
       if($scope.alteracao.login.trim().length < 3){
           $scope.showModalAlerta('Preencha um login com no mínimo 3 caracteres!');
           return false;
       }
       if($scope.alteracao.senha.trim().length < 3){
           $scope.showModalAlerta('Preencha uma senha com no mínimo 3 caracteres!');
           return false;
       }
       // Altera
       $scope.showProgress(divPortletBodyDadosPos);
       var jsonDadoAcesso = {
           id : $scope.alteracao.id,
           login : $scope.alteracao.login,
           senha : $scope.alteracao.senha,
           estabelecimento : $scope.alteracao.estabelecimento
       };
       //console.log(jsonDadoAcesso);
       $webapi.update($apis.getUrl($apis.pos.loginoperadora, undefined,
                                   {id : 'token', valor : $scope.token}), jsonDadoAcesso) 
            .then(function(dados){           
                $scope.showAlert('Alterado com sucesso!', true, 'success', true);
                // Esconde a linha
                $scope.cancelaAlteracao();
                // Relista
                $scope.buscaSenhasInvalidas(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao atualizar os dados (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress(divPortletBodyDadosPos);
              }); 
    };
    
}]);